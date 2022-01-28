import React from 'react';
import {Card, EmptyState as ES} from '@shopify/polaris';

const EmptyState = (props)=>{
    return (
            <ES
                heading={props.heading || ''}
                action={{ content: props.content || '' }}
                image="https://app.rocketfy.co/assets/img/icons4/planet5.svg"
                fullWidth
            >
            </ES>
    );
}

export default EmptyState;