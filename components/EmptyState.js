import React from 'react';
import {Card, EmptyState as ES} from '@shopify/polaris';

const EmptyState = (props)=>{
    return (
            <ES
                heading={props.heading || ''}
                action={{ content: props.content || '' }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                fullWidth
            >
            </ES>
    );
}

export default EmptyState;