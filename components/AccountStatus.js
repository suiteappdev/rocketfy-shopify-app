import React, {useCallback, useState, useEffect } from 'react';
import {AccountConnection, Link} from '@shopify/polaris';

const AccountStatus  = (props)=> {
  console.log("AccountStatus", props);
    const buttonText = props.status ? 'Desconectar' : 'Conectar';
    const details = props.status ? 'Cuenta conectada' : 'Cuenta no conectada';
    const terms = props.status ? null : (
      <p>
        Haciendo click en<strong> Conectar</strong>, Usted esta aceptando los
        <Link external url="https://www.rocketfy.co/terminos/"> terminos y condiciones</Link> de rocketfy.
      </p>
    );
  
    return (
      <AccountConnection
        accountName={props.shop || ''}
        connected={props.status}
        title={props.shop || ''}
        action={{
          content: buttonText,
          onAction: ()=>{
            if(props.status){
               props.actionDisconnect()
            }else{
               props.actionConnect();
            }
          },
        }}
        details={details}
        termsOfService={terms}
      />
    );
}

export default AccountStatus