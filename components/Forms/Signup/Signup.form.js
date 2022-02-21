import React, {useState, useEffect} from 'react';
import {Button, TextField, Form, FormLayout, Banner, Toast, InlineError, ButtonGroup } from '@shopify/polaris'
import styles from './Signup.module.css';
import { useQuery } from '@apollo/client';
import  {STORE_QUERY, DATA_KEY}  from '../../../graphql/querys/store.query';
import { Post, Get, PostRequest, refreshToken, verifyUrl, Put } from '../../../helpers/request.helper';
import {getRocketfyToken} from '../../../helpers/storage.helper';
import { getISO } from '../../../helpers/country.helper';
import AccountStatus from '../../AccountStatus';

const ROCKETFY_APIHOST = process.env.ROCKETFY_APIHOST 

const SignupForm = (props)=>{
    const [form, setForm] = useState({
        txtShop : ''
    });
    const [storeData, setStoreData] = useState({});
    const [isLoading, setLoading] = useState(false);
    const {loading, error, data} = useQuery(STORE_QUERY);
    const [connected, setConnected] = useState(false);
    const [errors, setError] = useState({
        txtAddress : false,
        txtEmail : false,
        txtFullname : false,
        txtPhone : false,
        txtDocument : false,
        txtShop : false
    });
    const [user, setUser] = useState({});

    const [showToast, setShowToast] = useState({
        content : '',
        active : false,
    });
    
    useEffect(()=>{
        let isConnected  = async ()=>{
            setLoading(true);
            let rs = await Get(`/api/settings/me/${data[DATA_KEY].myshopifyDomain}`).catch((e)=>{
                setLoading(false);
                toast({ content : "Ocurrio un error al obtener la información de la cuenta.", active : true,});
            });

            setUser(rs);

            if(rs && rs.connected){
                setConnected(true);
                setLoading(false);
            }else{
                setConnected(false);
                setLoading(false);
            }
        }


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

           isConnected();
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

    const disconnect = async (user)=>{
        let r = await Put(`/api/settings/status/${user._id}`, {
            connected : false
        });

        if(r){
            toast({ content : `${'Desconectado'}`, active : true});
            setLoading(true);
            setConnected(false);
            setLoading(false);
        }
    }

    const connect = async ()=>{
        setLoading(true);

        if(!user._id){
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
                hubspot : {
                    
                }
            }

            let response = await PostRequest(`${ROCKETFY_APIHOST}/api/public/createAccount` , data).catch(e=>toast({
                content : "Ocurrio un error al conectar la cuenta.",
                active : true,
            }));

            if(response){
                if(response.data.redirectUrl){
                    let setting = await Post(`/api/settings` , {
                        connected : true,
                        shop : form.txtShop,
                        domain : form.txtDomain,
                        urlRedirect : response.data.redirectUrl,
                        customer : data.customer,
                        customerID : response.data.customerID,
                        access_token : getRocketfyToken()
                    }).catch(e=>toast({
                        content : `Ocurrio un error al conectar la cuenta. ${e.message}`,
                        active : true,
                    }));

                    if(setting){
                        setConnected(true);
                        setLoading(false);
                        toast({
                            content : "Cuenta conectada.",
                            active : true,
                        });                    
                    }
                }
            }            
        }else{
            let r = await Put(`/api/settings/status/${user._id}`, {
                connected : true
            });

            if(r){
                toast({ content : `Conectado`, active : true});
                setConnected(true);
                setLoading(false);
            }
        }
    }

    const open = async (event)=>{
        event.preventDefault();
        let refresh = await refreshToken(user.access_token, user.customerID);
        if(refresh && refresh.data){
            let url = await verifyUrl({
                redirectUrl : refresh.data.redirectUrl
            });
            window.open(url.application); 
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
                    <AccountStatus status={connected} actionDisconnect={()=>disconnect(user)} actionConnect={connect} shop={form.txtShop || ''} />
                    {user._id ? (
                        <React.Fragment styles={{marginTop:'30px'}}>
                            <ButtonGroup>
                                <Button primary onClick={open}>Ir a panel de envios en Rocketfy</Button>
                            </ButtonGroup>
                        </React.Fragment>
                    ) : (
                         <React.Fragment>
                            <TextField
                                value={form.txtAddress}
                                onChange={onChange}
                                onBlur={()=>{
                                    if(!form.txtAddress){
                                        setError({...errors, txtAddress : true});
                                    }else{
                                        setError({...errors, txtAddress : false});
                                    }
                                }}
                                label="Dirección de recolección"
                                id="txtAddress"
                                type="text"
                            />
                            {errors.txtAddress ? (<InlineError message="Dirección de la tienda es requerida" fieldID="txtAddress" />) : (null)}
                            <TextField
                                value={form.txtPhone}
                                onChange={onChange}
                                label="Télefono"
                                id="txtPhone"
                                onBlur={()=>{
                                    if(!form.txtPhone){
                                        setError({...errors, txtPhone : true});
                                    }else{
                                        setError({...errors, txtPhone : false});
                                    }
                                }}
                                type="text"
                            />
                             {errors.txtPhone ? (<InlineError message="El campo télefono es requerido" fieldID="txtPhone" />) : (null)}
                            <TextField
                                value={form.txtDocument}
                                onChange={onChange}
                                label="Número documento"
                                id="txtDocument"
                                onBlur={()=>{
                                    if(!form.txtDocument){
                                        setError({...errors, txtDocument : true});
                                    }else{
                                        setError({...errors, txtDocument : false});
                                    }
                                }}
                                type="text"
                            />
                            {errors.txtDocument ? (<InlineError message="El campo numero de documento" fieldID="txtDocument" />) : (null)}
                            <TextField
                                value={form.txtShop}
                                onChange={onChange}
                                label="Nombre de la tienda"
                                disabled={true}
                                onBlur={()=>{
                                    if(!form.txtPhone){
                                        setError({...errors, txtShop : true});
                                    }else{
                                        setError({...errors, txtShop : false});
                                    }
                                }}
                                id="txtShop"
                                type="text"
                            />
                            {errors.txtShop ? (<InlineError message="El campo nombre de la tienda" fieldID="txtShop" />) : (null)}
                            <TextField
                                value={form.txtFullname}
                                onChange={onChange}
                                label="Nombre completo"
                                onBlur={()=>{
                                    if(!form.txtFullname){
                                        setError({...errors, txtFullname : true});
                                    }else{
                                        setError({...errors, txtFullname : false});
                                    }
                                }}
                                id="txtFullname"
                                type="text"
                            />
                            {errors.txtFullname ? (<InlineError message="El campo nombre completo es requerido" fieldID="txtFullname" />) : (null)}
                            <TextField
                                value={form.txtEmail}
                                onChange={onChange}
                                label="Email"
                                id="txtEmail"
                                onBlur={()=>{
                                    if(!form.txtEmail){
                                        setError({...errors, txtEmail : true});
                                    }else{
                                        setError({...errors, txtEmail : false});
                                    }
                                }}
                                type="text"
                            />
                            {errors.txtEmail ? (<InlineError message="El campo email es requerido" fieldID="txtEmail" />) : (null)}

                    </React.Fragment>
                    )}
                    </FormLayout>
            )}
            { showToast.active ? (<Toast content={showToast.content} onDismiss={()=>setShowToast({ active : false })} />) : null } 
        </Form>

    );
}

export default SignupForm