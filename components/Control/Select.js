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
                    value : c._id,
                    state : c.state.id,
                    stateName : c.state.name,
                    cityName : c.name
                }));
            };

            let response  = await getCities(true).catch(()=>console.log("No se pudieron recuperar las ciudades"));
            setCities(mapOptions(response));
        }

        cities();

    }, []);

    return (
        <Select options={cities || []} {...props} />
    )
}

export default City;