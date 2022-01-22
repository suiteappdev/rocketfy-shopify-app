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

            let response  = await getCities().catch(()=>console.log("No se pudieron recuperar las ciudades"));
            console.log(response);
            setCities(mapOptions(response));
        }

        cities();

    }, [cities]);

    return (
        <Select options={cities || []} {...props} />
    )
}

export default City;