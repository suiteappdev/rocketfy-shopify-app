import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Avatar,Badge , Icon , ResourceItem, ResourceList, TextStyle, useIndexResourceState,Banner,Spinner, Card, IndexTable, Button, Modal, Stack, TextContainer, TextField, FormLayout} from '@shopify/polaris';
import moment from 'moment'; 
import { mapCourrier } from '../../../helpers/location.helper';
import { ORDER_BY_ID } from '../../../graphql/querys/orderById.query';
import { createOrder, shippingCost } from '../../../helpers/order.helper';
import { useQuery } from '@apollo/client';
import City from '../../Control/Select';
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

import {
  CircleTickMajor
} from '@shopify/polaris-icons';
import {createCarrier} from '../../../helpers/carrier.helper';

const Datatable = (props)=>{
     const [orders, setOrders]  = useState([]);
     const [curriers, setCurriers]  = useState([]);
     const [currentOrder, setCurrentOrder]  = useState({});
     const [shopifyToken, setShopifyToken]  = useState("");
     const [selectedResource, setResource]  = useState({});
     const [OrderSuccess, setOrderSuccess]  = useState(false);
     const [loading, setLoading]  = useState(false);
     const [orderLoading, setOrderLoading]  = useState(false);
     const [shipping, setshipping]  = useState({
       Alto : '0',
       Ancho : '0',
       Largo : '0',
       Peso : '1',
       from : {},
       to : {},
       destination :{}
     });
     const app = useAppBridge();

     useEffect(()=>{
        let getToken = async ()=>{
          const token = await getSessionToken(app);
          if(token){
            setShopifyToken(token);
          }
        }
        getToken();

     }, []);

     const OnChangedShipping  = (value, key)=>{
       setshipping({...shipping, [key] : value});
     }

     const getShipping = async ()=>{
        setLoading(true);
        let response = await shippingCost(currentOrder, shipping);
        setCurriers(response.courriers);
        setshipping({
          ...shipping,
          destination : response.to
        })
        setLoading(false);
     }

     const useImperativeQuery = (query) => {
      const { refetch } = useQuery(query, { skip: true });
      
      const imperativelyCallQuery = (variables) => {
        return refetch(variables);
      } 
      
      return imperativelyCallQuery;
    }

    const createDeliveryService = async ()=>{
        let response = await createCarrier(shopifyToken).catch((e)=>{
          console.log(e);
        });

        console.log("response", response);
    }

    const [active, setActive] = useState(false);
    const node = useRef(null);
  
    const toggleModal = useCallback(async (order) => {
      setActive((active) => !active)
      if(order){
        setCurrentOrder(order);
        let response = await callQuery({ id : order.id}).catch((e)=>console.log(e.message));
        setCurriers([]);
        setshipping({
          Alto : '0',
          Ancho : '0',
          Largo : '0',
          Peso : parseInt(response.data.order.currentTotalWeight / 1000).toFixed().toString(),
          from : {},
          to : {},
          destination :{}
        });
      }
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

                  if(response){
                    let order = await createOrder(response.data, shipping);
                    console.log(order);
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
            <IndexTable.Cell><Badge status="warning">{node.displayFinancialStatus.toLowerCase()}</Badge></IndexTable.Cell>
            <IndexTable.Cell>${node.currentTotalPriceSet.shopMoney.amount}</IndexTable.Cell>
            <IndexTable.Cell><Button primary onClick={()=>toggleModal(node)}>Cotizar</Button></IndexTable.Cell>
            </IndexTable.Row>
          )
      }
      );
    
      return (
        <Card>
           {OrderSuccess ? (
                  <div style={{paddingBottom:'30px'}}>
                    <Banner
                    style={{marginBottom:'30px'}}
                    title="Tu orden a sido enviada a rocketfy correctamente"
                    status="success"
                    onDismiss={() => setOrderSuccess(false)}
                  />
                  <br />
                  </div>
            ) : (null)}
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
              {title: 'Fecha'},
              {title: 'Cliente'},
              {title: 'Dirección'},
              {title: 'Ciudad'},
              {title: 'Estado'},
              {title: 'Total'},
              {title: 'Transportadora'}
            ]}
          >
            {rowMarkup}
          </IndexTable>
          <Button primary onClick={()=>createDeliveryService()}>Crear Transportadoras</Button>
      <Modal
        open={active}
        onClose={toggleModal}
        title= {`Cotizar envio - ${currentOrder.name}`}
        secondaryActions={
          {
            content: 'Cerrar',
            onAction: toggleModal,
          }
        }
        primaryAction={ selectedResource.id ? (
          {
            content: `Enviar a Rocketfy - ${selectedResource.id}`,
            onAction: async ()=>{
              setOrderLoading(true);
              let response = await callQuery({ id : currentOrder.id}).catch((e)=>console.log(e.message));
              
              if(response){
                let order = await createOrder(response.data, shipping).catch((e)=>console.log(e.message));
                if(order){
                    setOrderSuccess(true);
                    setOrderLoading(false);
                    toggleModal();
                }
              }
            },
            loading : (orderLoading ? true : false)
          }
        ) : null}
      >
        <Modal.Section>
          <Stack vertical>
            <Stack.Item>
              <TextContainer>
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
                    }} value={shipping.from} selectProps={{
                      placeholder : "Ciudad origen"
                    }} name={'from'}></City>
                    <br />
                    <p style={{ marginBottom:'10px'}}>
                    Destino del paquete
                    </p>
                    <City placeholder="Ciudad destino" onChange={(value)=>{
                      setshipping({...shipping, to : value});
                    }} value={shipping.to} selectProps={{
                      placeholder : "Ciudad destino"
                    }} name={'to'}></City>
                    <br />
                    <Button primary onClick={()=>getShipping()}>Cotizar</Button>
                </div>
                <div style={{width:'50%', paddingLeft:'10px', paddingRight:'10px', display:'flex', alignItems : 'center', justifyContent:'center', flexDirection:'column', paddingTop: '39px'}}>
                  {loading  ? (
                    <svg xmlns="http://www.w3.org/2000/svg"  style={{ position : 'relative', top : '-20px'}} width="44" height="44" viewBox="0 0 44 44" stroke="#7a13c1">
                    <g fill="none" fill-rule="evenodd" stroke-width="2">
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                            <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                            <animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
                        </circle>
                    </g>
                  </svg>
                  ) : (
                    <div style={{width:'100%'}}>
                      <Card>
                        <ResourceList
                          resourceName={{singular: 'transportadora', plural: 'transportadoras'}}
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
                                onClick = {()=>{
                                  setResource(item);
                                }}
                                id={id}
                                url={url}
                                media={<Avatar customer size="medium" name={name} source={avatarSource} />
                                }
                                accessibilityLabel={`Transportadora ${name}`}
                                name={name}
                              >

                                <h3>
                                  <TextStyle variation="strong">{name} </TextStyle>
                                </h3>
                                <div>{formatCurrency("es-CO", "COP", 2, location)}</div>
                                {(selectedResource.id === id) ? (
                                  <div style={{position : 'absolute', top : '21px', right : '21px'}}>
                                      <Icon source={CircleTickMajor} color="primary" />                                
                                  </div>
                                ) : (null)} 
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