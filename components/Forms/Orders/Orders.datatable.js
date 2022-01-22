import React, {useCallback, useRef, useState} from 'react';
import {useIndexResourceState,Banner, Card, IndexTable, Button, Modal, Stack, TextContainer, TextField, FormLayout} from '@shopify/polaris';
import moment from 'moment'; 
import { mapCourrier } from '../../../helpers/location.helper';
import { ORDER_BY_ID } from '../../../graphql/querys/orderById.query';
import { createOrder, shippingCost } from '../../../helpers/order.helper';
import { useQuery } from '@apollo/client';
import City from '../../Control/Select';

const Datatable = (props)=>{
     const [orders, setOrders]  = useState([]);
     const [currentOrder, setCurrentOrder]  = useState({});
     const [shipping, setshipping]  = useState({
       Alto : 0,
       Ancho : 0,
       Largo : 0,
       Peso : 1,
       from : {},
       to : {}
     });

     const OnChangedShipping  = (value, key)=>{
       setshipping({...shipping, [key] : value});
     }

     const useImperativeQuery = (query) => {
      const { refetch } = useQuery(query, { skip: true });
      
      const imperativelyCallQuery = (variables) => {
        return refetch(variables);
      } 
      
      return imperativelyCallQuery;
    }

    const [active, setActive] = useState(false);
    const node = useRef(null);
  
    const toggleModal = useCallback((order) => {
      setActive((active) => !active)
      console.log("currentOrder", order);
    }, []);
       const callQuery = useImperativeQuery(ORDER_BY_ID);

      const resourceName = {
        singular: 'order',
        plural: 'orders',
      };

      if(props.orders.length > 0 && props.cities.length > 0){
        (async () => {
          let orderList = await mapCourrier(props.orders, props.cities);
           setOrders(orderList);
        })()
      }

      const resourceIDResolver = (orders) => {
        return orders.node.id;
      };
    
      const {
        selectedResources,
        allResourcesSelected,
        handleSelectionChange,
      } = useIndexResourceState(orders, { resourceIDResolver });

      const promotedBulkActions = [
        {
          content: 'Enviar ordenes a rocketfy',
          onAction: async () =>{
            for (let index = 0; index < selectedResources.length; index++) {
                  let o = selectedResources[index];
                  let response = await callQuery({ id : o}).catch((e)=>console.log(e.message));

                  console.log("orderById", response);

                  if(response){
                    let order = await createOrder(response.data);
                  }
            }
          },
        },
        {
          content: 'Ir a Rocketfy',
          onAction: () => {
            props.toApp()
          },
        },
      ];



      const rowMarkup = orders.map(
         ({node}, index) => {
           return(
            <IndexTable.Row
              id={node.id}
              key={node.id}
              selected={selectedResources.includes(node.id)}
              position={index}
            >
            <IndexTable.Cell>{node.name}</IndexTable.Cell>
            <IndexTable.Cell>{moment(node.createdAt).format('LLL')}</IndexTable.Cell>
            <IndexTable.Cell>{`${node.customer.firstName} ${node.customer.lastName}`}</IndexTable.Cell>
            <IndexTable.Cell>{`${node.billingAddress.address1} ${node.billingAddress.address2}`}</IndexTable.Cell>
            <IndexTable.Cell>{node.shippingAddress.city}</IndexTable.Cell>
            <IndexTable.Cell>{node.shippingAddress.province}</IndexTable.Cell>
            <IndexTable.Cell>${node.currentTotalPriceSet.shopMoney.amount}</IndexTable.Cell>
            <IndexTable.Cell><Button onClick={()=>toggleModal(node)}>Cotizar</Button></IndexTable.Cell>
            </IndexTable.Row>
          )
      }
      );
    
      return (
        <Card>
          <IndexTable
            resourceName={resourceName}
            itemCount={orders.length}
            selectedItemsCount={
              allResourcesSelected ? 'All' : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            promotedBulkActions={promotedBulkActions}
            headings={[
              {title: '# Pedido'},
              {title: 'Fecha del Pedido'},
              {title: 'Cliente'},
              {title: 'Dirección'},
              {title: 'Ciudad'},
              {title: 'Provincia'},
              {title: 'Total'},
              {title: 'Transportadora'}
            ]}
          >
            {rowMarkup}
          </IndexTable>
      <Modal
        open={active}
        onClose={toggleModal}
        title="Cotizar envio"
        primaryAction={{
          content: 'Cerrar',
          onAction: toggleModal,
        }}
      >
        <Modal.Section>
          <Stack vertical>
            <Stack.Item>
              <TextContainer>
              <Banner
                title="Tu orden a sido enviada a rocketfy correctamente"
                status="success"
                onDismiss={() => {}}
              />
                <p>
                  Por favor configure las dimensiones de su paquete.
                </p>
              </TextContainer>
            </Stack.Item>
            <Stack.Item fill>
            <FormLayout>
              <FormLayout.Group condensed>
                <TextField
                  prefix="kg"
                  type="text"
                  value={shipping.Peso}
                  label="Peso"
                  onChange={(value)=>OnChangedShipping(value, 'Peso')}
                  autoComplete="off"
                />
                <TextField
                  prefix="cms"
                  value={50}
                  type="text"
                  label="Alto"
                  onChange={(value)=>OnChangedShipping(value, 'Alto')}
                  autoComplete="off"
                />
                <TextField
                  prefix="cms"
                  value={shipping.Ancho}
                  type="text"
                  label="Ancho"
                  onChange={(value)=>OnChangedShipping(value, 'Ancho')}
                  autoComplete="off"
                />
                <TextField
                  prefix="cms"
                  value={shipping.Largo}
                  type="text"
                  label="Largo"
                  onChange={(value)=>OnChangedShipping(value, 'Largo')}
                  autoComplete="off"
                /> 
              </FormLayout.Group>
              <div style={{height: '225px', display:'flex', alignItems:'left', flexDirection:'row'}}>
                <div style={{ width : '50%'}}>
                    <p>
                    Seleccione origen del paquete.
                    </p>
                    <City placeholder="Ciudad origen" onChange={(value)=>{
                      console.log("ciudad origen", value);
                      setshipping({...shipping, from : value});
                    }} value={shipping.from} selectProps={{
                      placeholder : "Ciudad origen"
                    }} name={'from'}></City>
                    <br />
                    <p>
                    Seleccione destino del paquete.
                    </p>
                    <City placeholder="Ciudad destino" onChange={(value)=>{
                      console.log("ciudad destino", value);
                      setshipping({...shipping, to : value});
                    }} value={shipping.to} selectProps={{
                      placeholder : "Ciudad destino"
                    }} name={'to'}></City>
                </div>
                <div style={{width:'50%'}}>
                    <p>Resultado de cotización</p>
                </div>
              </div>
            </FormLayout>
            </Stack.Item>
          </Stack>
        </Modal.Section>
      </Modal>
        </Card>
      );
}

export {Datatable};