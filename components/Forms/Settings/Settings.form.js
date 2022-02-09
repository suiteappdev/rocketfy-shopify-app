import React, {useCallback, useState, useEffect} from 'react';
import {Form, FormLayout, Banner, Toast, AccountConnection, Link} from '@shopify/polaris'
import styles from './Signup.module.css';
import { useQuery } from '@apollo/client';
import  {STORE_QUERY, DATA_KEY}  from '../../../graphql/querys/store.query';
import { PostRequest, refreshToken, verifyUrl } from '../../../helpers/request.helper';
import { isConnected, removeRocketfyToken, setAppToken, setCustomerId} from '../../../helpers/storage.helper';
import { getISO } from '../../../helpers/country.helper';

const ROCKETFY_APIHOST = process.env.ROCKETFY_APIHOST;

const Settings = (props)=>{
    const [form, setForm] = useState({});
    const [storeData, setStoreData] = useState({});
    const [isLoading, setLoading] = useState(false);
    const {loading, error, data} = useQuery(STORE_QUERY);
    const [connected, setConnected] = useState(false);
    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });

    const accountName = connected ? 'Jane Appleseed' : '';
  
    const handleAction = useCallback(() => {
      setConnected((connected) => !connected);
    }, [connected]);
  
    const buttonText = connected ? 'Desconectar' : 'Conectar';
    const details = connected ? 'Webhook Conectado' : 'Webhook no conectado';
    const terms = connected ? null : (
      <p>
        By clicking <strong>Connect</strong>, you agree to accept Sample App’s{' '}
        <Link url="Example App">terms and conditions</Link>. You’ll pay a
        commission rate of 15% on sales made through Sample App.
    </p>)
    
    useEffect(()=>{
        setConnected(isConnected());

        if (data){
           setStoreData(data[DATA_KEY]);
           setForm({
               txtShop : data[DATA_KEY].name,
               email : data[DATA_KEY].email,
               txtAddress : data[DATA_KEY].billingAddress.address1,
               txtPhone : data[DATA_KEY].billingAddress.phone,
               txtEmail : data[DATA_KEY].email,
               txtFullname : `${data[DATA_KEY].billingAddress.firstName || ''} ${data[DATA_KEY].billingAddress.lastName || ''}`,
               txtDomain : data[DATA_KEY].myshopifyDomain,
               txtProvince :  data[DATA_KEY].billingAddress.province,
               txtCountry : getISO(data[DATA_KEY].billingAddress.countryCodeV2).iso3,
               txtCity : data[DATA_KEY].billingAddress.city
           });
        }
    }, [data, connected]);

    const onChange = (value, id)=>{
        setForm({...form, [id] : (value)});
    }

    const toast = (options)=>{
        setShowToast({
            active : options.active,
            content :options.content
        });
    }

    const disconnect = ()=>{
        setLoading(true);
        setConnected(false);
        removeRocketfyToken();
        setLoading(false);
        localStorage.clear();
    }

    const connect = async ()=>{
        setLoading(true);
        
        let data = {
            email: form.txtEmail,
            name: form.txtShop,
            customer_name : form.txtFullname,
            country : form.txtCountry,
            phone : form.txtPhone,
            terms : true,
            origin_city :form.txtCity,
            origin_departament: form.txtProvince,
            address_shop:form.txtAddress,
            customer_domain : form.txtDomain,
            partnerID:process.env.ROCKETFY_PARTNERID,
        }

        let response = await PostRequest(`http://localhost:4001/api/public/createAccount` , data).catch(e=>toast({
            content : "Ocurrio un error al conectar la cuenta.",
            active : true,
        }));

        if(response){
            if(response.data.redirectUrl){
                //let url = await verifyUrl({ redirectUrl : response.data.redirectUrl}).catch(async (e)=>console.log("error", e));
                    setConnected(true);
                    setLoading(false);
                    setAppToken(response.data.redirectUrl);
                    setCustomerId(response.data.customerID);
                    toast({
                        content : "Cuenta conectada.",
                        active : true,
                    });
            }
        }
    }

    return (
        <Form>
            {loading || isLoading ? (
                    <div  className={styles.spinner}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" stroke="#7a13c1">
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
                    </div>
                ) : (
                <FormLayout>
                  <AccountConnection
                        accountName={accountName}
                        connected={connected}
                        title="Sincronizar automaticamente pedidos"
                        action={{
                            content: buttonText,
                            onAction: handleAction,
                        }}
                        details={details}
                        termsOfService={terms}
                 />
                   {connected ? (null) : (
                    <React.Fragment>
                     
                   </React.Fragment>)}
            </FormLayout>
            )}
            { showToast.active ? (<Toast content={showToast.content} onDismiss={()=>setShowToast({ active : false })} />) : null } 
        </Form>

    );
}

export default Settings