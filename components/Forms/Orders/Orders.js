import React, {useCallback, useRef, useState} from 'react';
import {Avatar, ResourceItem, ResourceList, TextStyle, useIndexResourceState,Banner,Spinner, Card, IndexTable, Button, Modal, Stack, TextContainer, TextField, FormLayout} from '@shopify/polaris';
import moment from 'moment'; 
import { mapCourrier } from '../../../helpers/location.helper';
import { ORDER_BY_ID } from '../../../graphql/querys/orderById.query';
import { createOrder, shippingCost } from '../../../helpers/order.helper';
import { useQuery } from '@apollo/client';
import City from '../../Control/Select';
import './Orders.module.css';

const Datatable = (props)=>{
     const [orders, setOrders]  = useState([]);
     const [curriers, setCurriers]  = useState([]);
     const [currentOrder, setCurrentOrder]  = useState({});
     const [OrderSuccess, setOrderSuccess]  = useState(false);
     const [loading, setLoading]  = useState(false);
     const [shipping, setshipping]  = useState({
       Alto : '0',
       Ancho : '0',
       Largo : '0',
       Peso : '1',
       from : {},
       to : {}
     });

     const OnChangedShipping  = (value, key)=>{
       setshipping({...shipping, [key] : value});
     }

     const getShipping = async ()=>{
        setLoading(true);
        let response = await shippingCost(currentOrder, shipping);
        console.log("R", response);
        setCurriers(response.courriers);
        setLoading(false);
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
      setCurrentOrder(order);
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

      const mapCurrier = (order)=>{
        return curriers.map((c)=>{
            return (
                <p onClick={()=>{}} className=''><img  className='carrier-logo' src={c.img} alt="" /> {c.name}  <span> {formatCurrency("es-CO", "COP", 2,c.shipping_value)} </span></p>
            )
        });
    }

    const formatCurrency  = (locales, currency, fractionDigits, number)  =>{
      let formatted = new Intl.NumberFormat(locales, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: fractionDigits
      }).format(number);

      return formatted;
    }

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
                {OrderSuccess ? (
                   <Banner
                   title="Tu orden a sido enviada a rocketfy correctamente"
                   status="success"
                   onDismiss={() => {}}
                 />
                ) : (null)}
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
                  value={shipping.Alto}
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
                    <p style={{ marginBottom:'10px'}}>
                    Seleccione origen del paquete.
                    </p>
                    <City placeholder="Ciudad origen" onChange={(value)=>{
                      setshipping({...shipping, from : value});
                      console.log("shipping", shipping);
                    }} value={shipping.from} selectProps={{
                      placeholder : "Ciudad origen"
                    }} name={'from'}></City>
                    <br />
                    <p style={{ marginBottom:'10px'}}>
                    Seleccione destino del paquete.
                    </p>
                    <City placeholder="Ciudad destino" onChange={(value)=>{
                      setshipping({...shipping, to : value});
                      console.log("shipping", shipping);
                    }} value={shipping.to} selectProps={{
                      placeholder : "Ciudad destino"
                    }} name={'to'}></City>
                    <br />
                    <Button primary onClick={()=>getShipping()}>Cotizar</Button>
                </div>
                <div style={{width:'50%', paddingLeft:'10px', paddingRight:'10px'}}>
                  {loading  ? ( <Spinner accessibilityLabel="Spinner example" size="large" />) : (
                    <div>
                      <p style={{textAlign:'center', marginBottom:'10px'}}>Resultado de cotización</p>
                      <Card>
                        <ResourceList
                          resourceName={{singular: 'customer', plural: 'customers'}}
                          items={curriers.map(c=>({
                              id: c.key,
                              url: '',
                              avatarSource:c.img,
                              name: c.name,
                              location: c.shipping_value,
                          }))}
                          renderItem={(item) => {
                            const {id, url, avatarSource, name, location} = item;

                            return (
                              <ResourceItem
                                onClick={()=>{
                                  alert("Hola");
                                }}
                                id={id}
                                url={url}
                                media={
                                  <Avatar customer size="medium" name={name} source={avatarSource} />
                                }
                                accessibilityLabel={`View details for ${name}`}
                                name={name}
                              >
                                <h3>
                                  <TextStyle variation="strong">{name}</TextStyle>
                                </h3>
                                <div>{formatCurrency("es-CO", "COP", 2, location)}</div>
                              </ResourceItem>
                            );
                          }}
                        />
                      </Card>
                    </div>
                  )}
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