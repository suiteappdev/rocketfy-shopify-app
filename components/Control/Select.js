import Select from 'react-select';
import { useEffect, useState } from 'react';
import { getCities } from '../../helpers/location.helper';

const City  = (props)=>{
    const [cities, setCities] = useState([]);

    useEffect(()=>{
        let cities =  async ()=>{
            let mapOptions = (data)=>{
                return data.map((c)=>({
                    label : `${c.name} - ${c.state.name}`,
                    value : c.id,
                    state : c.state.id
                }));
            };

            let response  = await getCities();

            if(response){
                setCities(mapOptions(response.data));
                console.log("cities state", cities);
            }
        }

        cities();

    }, []);

    return (
        <Select options={cities || []} {...props} />
    )
}

export default City;