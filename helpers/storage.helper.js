const getRocketfyToken = ()=>{
    return window.localStorage.getItem('rocketfy-token');
}

const setRocketfyToken = (value)=>{
    return window.localStorage.setItem('rocketfy-token', value);
}

const removeRocketfyToken = (value)=>{
    return window.localStorage.removeItem('rocketfy-token');
}

const getAppToken = ()=>{
    return window.localStorage.getItem('rocketfy-app-token');
}

const setAppToken = (value)=>{
    return window.localStorage.setItem('rocketfy-app-token', value);
}

const setCustomerId = (value)=>{
    return window.localStorage.setItem('rocketfy-customerid', value);
}

const getCustomerId = ()=>{
    return window.localStorage.setItem('rocketfy-customerid');
}

const isConnected = ()=>{
    return getAppToken() != null ? true : false;
}

export { getRocketfyToken, isConnected, setRocketfyToken, removeRocketfyToken, setAppToken, getCustomerId, setCustomerId, getAppToken }