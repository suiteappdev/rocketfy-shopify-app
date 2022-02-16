import React, {useCallback, useState, useEffect} from 'react';
import {Card, Tabs, AppProvider} from '@shopify/polaris';

import SignupForm from './Forms/Signup/Signup.form.js';
import OrdersForm from './Forms/Orders/Orders.form.js';
import Settings from './Forms/Settings/Settings.form.js';
import { getCarriers as GetCarriers} from '../helpers/carrier.helper';
import { getJson, setJson } from '../helpers/storage.helper';
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function MainTabs(props) {
    const [selected, setSelected] = useState(0);
    const [carrier, setCarrier] = useState([]);
    const [token, setToken] = useState('');

    const app = useAppBridge();

    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex || 0),
      [],
    );

    useEffect(()=>{
        getToken();
        getCarrier();
    }, []);

    let getToken = async ()=>{
      const token = await getSessionToken(app);
          console.log("token", token);

      if(token){
          setJson('st', { st : token});
      }
    }

    const getCarrier = async ()=>{
      if(getJson('st')){
          let response = await GetCarriers(getJson('st').st).catch((e)=>{
              console.log(e);
          });

          if(response.data.carrier_services.length > 0){
              setCarrier(response.data[0]);
          }
      }
    }

    const tabs = [
      {
        id: 'all-customers-1',
        content: 'Cuenta Rocketfy',
        accessibilityLabel: 'All customers',
        panelID: 'all-customers-content-1',
        render :<SignupForm/>
      },
      {
        id: 'accepts-marketing-1',
        content: 'Pedidos',
        panelID: 'accepts-marketing-content-1',
        render :<OrdersForm setSelectedTab={handleTabChange} />
      },
      {
        id: 'settings-tab',
        content: 'Configuración',
        panelID: 'settings-tab-content',
        render :<Settings setSelectedTab={handleTabChange} carrier={carrier} />
      }
    ];
  
    return (
      <AppProvider
        i18n={{}}
        theme={{
          colors: {
            surface: '#111213',
            onSurface: '#111213',
            interactive: '#2e72d2',
            secondary: '#111213',
            primary: '#a74df9',
            critical: '#d82c0d',
            warning: '#ffc453',
            highlight: '#5bcdda',
            success: '#008060',
            decorative: '#ffc96b',
          },
        }}
      >
      <Card>
        <img src="https://app.rocketfy.co/assets/img/logo3.png" style={{width: '20%',  padding: '20px'}} alt="logo" />
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Card.Section title={''}>
            {tabs[selected].render}
          </Card.Section>
        </Tabs>
      </Card>
      </AppProvider>
    );
  }