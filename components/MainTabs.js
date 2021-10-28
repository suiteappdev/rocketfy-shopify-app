import React, {useCallback, useState, useEffect} from 'react';
import {Card, Tabs, AppProvider} from '@shopify/polaris';

import SignupForm from './Forms/Signup/Signup.form.js';
import OrdersForm from './Forms/Orders/Orders.form.js';

export default function MainTabs(props) {
    const [selected, setSelected] = useState(0);

    const handleTabChange = useCallback(
        (selectedTabIndex) => setSelected(selectedTabIndex || 0),
      [],
    );

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
        id: 'repeat-customers-1',
        content: 'Ubicaciones',
        panelID: 'repeat-customers-content-1',
        render : ()=>(
            <p>Ubicaciones</p>
        )
      },
      {
        id: 'prospects-1',
        content: 'Sincronizar productos',
        panelID: 'prospects-content-1',
        render : ()=>(
            <p>Productos</p>
        )
      },
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
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          <Card.Section title={''}>
            {tabs[selected].render}
          </Card.Section>
        </Tabs>
      </Card>
      </AppProvider>
    );
  }