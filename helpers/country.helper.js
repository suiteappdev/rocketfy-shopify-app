import countries from '../data/country_iso.json'

const getISO = (iso2)=>{
    let country = countries.find((c)=>c.iso2 == iso2);
    
    return country;
}


export { getISO }
