import React, {useCallback, useState, useEffect } from 'react';
import {AccountConnection, Link} from '@shopify/polaris';

const AccountStatus  = (props)=> {
    const [connected, setConnected] = useState(props.status);
    const shop = props.shop;

    useEffect(()=>{
        setConnected(props.status);
    });
  
    const buttonText = connected ? 'Desconectar' : 'Conectar';
    const details = connected ? 'Cuenta conectada' : 'Cuenta no conectada';
    const terms = connected ? null : (
      <p>
        Haciendo click en<strong> Conectar</strong>, Usted esta aceptando los
        <Link external url="https://www.rocketfy.co/terminos/"> terminos y condiciones</Link> de rocketfy.
      </p>
    );
  
    return (
      <AccountConnection
        accountName={shop}
        connected={connected}
        title={props.shop}
        action={{
          content: buttonText,
          onAction: ()=>{
            if(connected){
                props.actionDisconnect();
                setConnected(false)
            }else{
                props.actionConnect()
                setConnected(true);
            }
          },
        }}
        details={details}
        termsOfService={terms}
      />
    );
}

export default AccountStatus