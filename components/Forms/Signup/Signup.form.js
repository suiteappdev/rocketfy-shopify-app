import React, {useCallback, useState, useEffect} from 'react';
import {Button, Spinner, TextField, Form, FormLayout, Banner, Toast} from '@shopify/polaris'
import styles from './Signup.module.css';
import { useQuery } from '@apollo/client';
import  {STORE_QUERY, DATA_KEY}  from '../../../graphql/querys/store.query';
import { PostRequest, refreshToken, verifyUrl } from '../../../helpers/request.helper';

import { isConnected, removeRocketfyToken, setAppToken, setCustomerId} from '../../../helpers/storage.helper';
import { getISO } from '../../../helpers/country.helper';
import AccountStatus from '../../AccountStatus';

const ROCKETFY_APIHOST = process.env.ROCKETFY_APIHOST;

const SignupForm = (props)=>{
    const [form, setForm] = useState({});
    const [storeData, setStoreData] = useState({});
    const [isLoading, setLoading] = useState(false);
    const {loading, error, data} = useQuery(STORE_QUERY);
    const [connected, setConnected] = useState(false);
    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });
    
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

        let response = await PostRequest(`${ROCKETFY_APIHOST}/api/public/createAccount` , data).catch(e=>toast({
            content : "Ocurrio un error al conectar la cuenta.",
            active : true,
        }));

        if(response){
            if(response.data.redirectUrl){
                let url = await verifyUrl({ redirectUrl : response.data.redirectUrl}).catch(async (e)=>console.log("error", e));
                if(url){
                    setConnected(true);
                    setLoading(false);
                    setAppToken(url.application);
                    setCustomerId(response.data.customerID);
                    toast({
                        content : "Cuenta conectada.",
                        active : true,
                    });
                }
            }
        }
    }

    return (
        <Form>
            {loading || isLoading ? (
                    <div  className={styles.spinner}>
                         <Spinner accessibilityLabel="Obteniendo informacion de la tienda" size="large" />
                    </div>
                ) : (
                <FormLayout>
                   <AccountStatus status={connected} actionDisconnect={disconnect} actionConnect={connect} shop={form.txtShop} />
                   {connected ? (null) : (
                    <React.Fragment>
                        <TextField
                            value={form.txtAddress}
                            onChange={onChange}
                            label="Dirección de recolección"
                            id="txtAddress"
                            type="text"
                        />
                        <TextField
                            value={form.txtPhone}
                            onChange={onChange}
                            label="Télefono"
                            id="txtPhone"
                            type="text"
                        />
                        <TextField
                            value={form.txtDocument}
                            onChange={onChange}
                            label="Número documento"
                            id="txtDocument"
                            type="text"
                        />
                        <TextField
                            value={form.txtShop}
                            onChange={onChange}
                            label="Nombre de la tienda"
                            id="txtShop"
                            type="text"
                        />
                        <TextField
                            value={form.txtFullname}
                            onChange={onChange}
                            label="Nombre completo"
                            id="txtFullname"
                            type="text"
                        />
                        <TextField
                            value={form.txtEmail}
                            onChange={onChange}
                            label="Email"
                            id="txtEmail"
                            type="text"
                        />
                   </React.Fragment>)}
            </FormLayout>
            )}
            { showToast.active ? (<Toast content={showToast.content} onDismiss={()=>setShowToast({ active : false })} />) : null } 
        </Form>

    );
}

export default SignupForm