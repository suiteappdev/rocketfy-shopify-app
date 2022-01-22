import Select from 'react-select';
import { useEffect, useState } from 'react';
import { getCities } from '../../helpers/location.helper';

const City  = (props)=>{
    const [cities, setCities] = useState([]);

    useEffect(()=>{
        let cities =  async ()=>{
            let response  = await getCities();
            console.log("cties response", response);
            if(response){
                setCities(response.data);
            }
        }

        cities();

    }, []);

    return (
        <Select {...props} />
    )
}

export default City;