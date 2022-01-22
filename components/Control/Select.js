import Select from 'react-select';

const City  = (props)=>{
    console.log("properties", props);
    return (
        <Select {...props} />
    )
}

export default City;