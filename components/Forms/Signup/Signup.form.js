import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  TextField,
  Select,
  Form,
  FormLayout,
  Banner,
  Toast,
  InlineError,
  ButtonGroup,
} from "@shopify/polaris";
import styles from "./Signup.module.css";
import _ from "underscore";
import { useQuery } from "@apollo/client";
import { STORE_QUERY, DATA_KEY } from "../../../graphql/querys/store.query";
import {
  Post,
  Get,
  PostRequest,
  refreshToken,
  verifyUrl,
  Put,
} from "../../../helpers/request.helper";
import { getCities } from "../../../helpers/location.helper";
import { getRocketfyToken } from "../../../helpers/storage.helper";
import { getISO } from "../../../helpers/country.helper";
import AccountStatus from "../../AccountStatus";

const SignupForm = (props) => {
  const handleSelectChangeCity = (value, id) => {
    console.log(value, id);
    setForm({ ...form, [id]: value });
  };

  const handleSelectChangeDepartament = (value, id) => {
    console.log(value, id);
    setForm({ ...form, [id]: value });
    setCities(
      locations
        .filter((c) => c.state.id == value)
        .map((e) => {
          return {
            label: e.name,
            value: e._id,
          };
        })
    );
  };

  const [form, setForm] = useState({
    txtShop: "",
  });

  const [storeData, setStoreData] = useState({});
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { loading, error, data } = useQuery(STORE_QUERY);
  const [connected, setConnected] = useState(false);
  const [errors, setError] = useState({
    txtEmail: false,
    txtFullname: false,
    txtPhone: false,
    txtDocument: false,
    txtShop: false,
    txtVia: false,
    txtNumero: false,
    txtCon: false,
    txtBarrio: false,
    txtCity: false,
    txtDepartament: false,
    formSubmited: false,
  });

  const [user, setUser] = useState({});

  const [showToast, setShowToast] = useState({
    content: "",
    active: false,
  });

  useEffect(() => {
    let isConnected = async () => {
      setLoading(true);

      let cities_list = await getCities();
      setLocations(cities_list);

      setStates(
        _.uniq(cities_list, (c) => c.state.id).map((c) => {
          return {
            label: c.state.name,
            value: c.state.id,
          };
        })
      );

      let rs = await Get(
        `/api/settings/me/${data[DATA_KEY].myshopifyDomain}`
      ).catch((e) => {
        setLoading(false);
        toast({
          content: "Ocurrio un error al obtener la información de la cuenta.",
          active: true,
        });
      });

      setUser(rs);

      if (rs && rs.connected) {
        setConnected(true);
        setLoading(false);
      } else {
        setConnected(false);
        setLoading(false);
      }
    };

    if (data) {
      setStoreData(data[DATA_KEY]);
      setForm({
        txtShop: data[DATA_KEY].name,
        email: data[DATA_KEY].email,
        txtPhone: data[DATA_KEY].billingAddress.phone,
        txtEmail: data[DATA_KEY].email,
        txtFullname: `${
          data[DATA_KEY].billingAddress.firstName
            ? data[DATA_KEY].billingAddress.firstName
            : ""
        }${
          data[DATA_KEY].billingAddress.lastName
            ? " " + data[DATA_KEY].billingAddress.lastName
            : ""
        }`,
        txtDomain: data[DATA_KEY].myshopifyDomain,
        txtProvince: data[DATA_KEY].billingAddress.province,
        txtCountry: getISO(data[DATA_KEY].billingAddress.countryCodeV2).iso3,
        txtCity: data[DATA_KEY].billingAddress.city,
      });

      isConnected();
    }
  }, [data, connected]);

  const onChange = (value, id) => {
    setForm({ ...form, [id]: value });
  };

  const toast = (options) => {
    setShowToast({
      active: options.active,
      content: options.content,
    });
  };

  const disconnect = async (user) => {
    let r = await Put(`/api/settings/status/${user._id}`, {
      connected: false,
    });

    if (r) {
      toast({ content: `${"Desconectado"}`, active: true });
      setLoading(true);
      setConnected(false);
      setLoading(false);
    }
  };

  const connect = async () => {
    if (user._id) {
      let r = await Put(`/api/settings/status/${user._id}`, {
        connected: true,
      });

      if (r) {
        toast({ content: `Conectado`, active: true });
        setConnected(true);
        setLoading(false);
      }

      return;
    }

    let fields = Object.values(errors);
    fields.shift();
    let IsInvalidForm = Object.values(form).some((v) => !v);

    if (fields.some((e) => e || IsInvalidForm)) {
      setError({ ...errors, formSubmited: true });
      return;
    }

    setLoading(true);

    if (!user._id) {
      let data = {
        email: form.txtEmail,
        name: form.txtShop,
        customer_name: form.txtFullname,
        country: form.txtCountry,
        phone: form.txtPhone,
        terms: true,
        origin_city: cities.find((c) => c.value == form.txtCity).label,
        origin_departament: states.find((c) => c.value == form.txtDepartament)
          .label,
        address_shop: `${form.txtVia} # ${form.txtNumero} - ${form.txtCon}, ${form.txtBarrio}`,
        composed_address: {
          street: form.txtVia || "",
          street_number_one: form.txtNumero || "",
          street_number_two: form.txtCon || "",
          neighborhood: form.txtBarrio || "",
        },
        customer_domain: form.txtDomain,
        partnerID: process.env.ROCKETFY_PARTNERID,
        hubspot: {},
      };

      console.log(
        "addresss",
        `${form.txtVia} # ${form.txtNumero} - ${form.txtCon}, ${form.txtBarrio}`
      );

      let response = await PostRequest(
        `${process.env.APIPUBLIC}api/public/createAccount`,
        data
      ).catch((e) =>
        toast({
          content: "Ocurrio un error al conectar la cuenta.",
          active: true,
        })
      );

      if (response) {
        if (response.data.redirectUrl) {
          let setting = await Post(`/api/settings`, {
            connected: true,
            shop: form.txtShop,
            domain: form.txtDomain,
            urlRedirect: response.data.redirectUrl,
            customer: data.customer,
            customerID: response.data.customerID,
            access_token: getRocketfyToken(),
          }).catch((e) =>
            toast({
              content: `Ocurrio un error al conectar la cuenta. ${e.message}`,
              active: true,
            })
          );

          if (setting) {
            setConnected(true);
            setLoading(false);
            toast({
              content: "Cuenta conectada.",
              active: true,
            });
          }
        }
      }
    } else {
      let r = await Put(`/api/settings/status/${user._id}`, {
        connected: true,
      });

      if (r) {
        toast({ content: `Conectado`, active: true });
        setConnected(true);
        setLoading(false);
      }
    }
  };

  const open = async (event) => {
    event.preventDefault();
    let refresh = await refreshToken(user.access_token, user.customerID);
    if (refresh && refresh.data) {
      let url = await verifyUrl({
        redirectUrl: refresh.data.redirectUrl,
      });
      console.log(url.application);
      window.open(url.application);
    }
  };

  return (
    <Form>
      {loading || isLoading ? (
        <div className={styles.spinner}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 44 44"
            stroke="#7a13c1"
          >
            <g fill="none" fill-rule="evenodd" stroke-width="2">
              <circle cx="22" cy="22" r="1">
                <animate
                  attributeName="r"
                  begin="0s"
                  dur="1.8s"
                  values="1; 20"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.165, 0.84, 0.44, 1"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  begin="0s"
                  dur="1.8s"
                  values="1; 0"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.3, 0.61, 0.355, 1"
                  repeatCount="indefinite"
                />
              </circle>
              <circle cx="22" cy="22" r="1">
                <animate
                  attributeName="r"
                  begin="-0.9s"
                  dur="1.8s"
                  values="1; 20"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.165, 0.84, 0.44, 1"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  begin="-0.9s"
                  dur="1.8s"
                  values="1; 0"
                  calcMode="spline"
                  keyTimes="0; 1"
                  keySplines="0.3, 0.61, 0.355, 1"
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </svg>
        </div>
      ) : (
        <FormLayout>
          {errors.formSubmited ? (
            <Banner
              title="Error en el formulario"
              onDismiss={() => setError({ ...errors, formSubmited: false })}
              status="critical"
            >
              {errors.txtAddress ? (
                <p>El campo dirección de recogida es incorrecto</p>
              ) : (
                ""
              )}
              {errors.txtDocument ? (
                <p>El campo numero de documento es incorrecto</p>
              ) : (
                ""
              )}
              {errors.txtPhone ? (
                <p>El campo numero télefonico es incorrecto</p>
              ) : (
                ""
              )}
              {errors.txtEmail ? (
                <p>El campo numero correo es incorrecto</p>
              ) : (
                ""
              )}
              {errors.txtFullname ? (
                <p>El campo nombre completo es incorrecto</p>
              ) : (
                ""
              )}
              {errors.txtVia ? <p>El campo Carrera/via es incorrecto</p> : ""}
              {errors.txtNumero ? <p>El campo Número es incorrecto</p> : ""}
              {errors.txtCon ? <p>El campo Con es incorrecto</p> : ""}
              {errors.txtBarrio ? <p>El campo Barrio es incorrecto</p> : ""}
            </Banner>
          ) : null}
          <AccountStatus
            status={connected}
            actionDisconnect={() => disconnect(user)}
            actionConnect={connect}
            shop={form.txtShop || ""}
          />
          {user._id ? (
            <React.Fragment styles={{ marginTop: "30px" }}>
              <ButtonGroup>
                <Button primary onClick={open}>
                  Ir a panel de envios en Rocketfy
                </Button>
              </ButtonGroup>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <TextField
                value={form.txtFullname}
                error={errors.txtFullname ? true : false}
                placeholder="Nombre completo"
                onChange={onChange}
                label="Nombre completo"
                onBlur={() => {
                  if (!form.txtFullname) {
                    setError({ ...errors, txtFullname: true });
                  } else {
                    setError({ ...errors, txtFullname: false });
                  }
                }}
                id="txtFullname"
                type="text"
              />
              <TextField
                value={form.txtDocument}
                onChange={onChange}
                error={errors.txtDocument ? true : false}
                label="Número documento"
                placeholder="Número documento"
                id="txtDocument"
                onBlur={() => {
                  if (!form.txtDocument) {
                    setError({ ...errors, txtDocument: true });
                  } else {
                    setError({
                      ...errors,
                      txtDocument: false,
                      formSubmited: false,
                    });
                  }
                }}
                type="text"
              />
              <TextField
                value={form.txtEmail}
                error={errors.txtEmail ? true : false}
                onChange={onChange}
                label="Email"
                placeholder="Email"
                id="txtEmail"
                onBlur={() => {
                  if (!form.txtEmail) {
                    setError({ ...errors, txtEmail: true });
                  } else {
                    setError({
                      ...errors,
                      txtEmail: false,
                      formSubmited: false,
                    });
                  }
                }}
                type="text"
              />
              <FormLayout>
                <FormLayout.Group condensed>
                  <Select
                    label="Departamento"
                    options={states}
                    error={errors.txtDepartament ? true : false}
                    placeholder="Departamento"
                    onChange={(value) =>
                      handleSelectChangeDepartament(value, "txtDepartament")
                    }
                    value={form.txtDepartament}
                    id="txtDepartament"
                    onBlur={() => {
                      if (!form.txtDepartament) {
                        setError({ ...errors, txtDepartament: true });
                      } else {
                        setError({ ...errors, txtDepartament: false });
                      }
                    }}
                  />
                  <Select
                    label="Ciudad"
                    error={errors.txtCity ? true : false}
                    options={cities}
                    onChange={(value) =>
                      handleSelectChangeCity(value, "txtCity")
                    }
                    placeholder="Ciudad"
                    value={form.txtCity}
                    id="txtCity"
                    onBlur={() => {
                      if (!form.txtCity) {
                        setError({ ...errors, txtCity: true });
                      } else {
                        setError({ ...errors, txtCity: false });
                      }
                    }}
                  />
                  <TextField
                    label="Cra"
                    error={errors.txtVia ? true : false}
                    id="txtVia"
                    placeholder="Carrera/Via"
                    value={form.txtVia}
                    onChange={onChange}
                    autoComplete="off"
                    onBlur={() => {
                      if (!form.txtVia) {
                        setError({ ...errors, txtVia: true });
                      } else {
                        setError({ ...errors, txtVia: false });
                      }
                    }}
                  />
                  <TextField
                    label="Número"
                    id="txtNumero"
                    prefix="#"
                    placeholder="00"
                    value={form.txtNumero}
                    error={errors.txtNumero ? true : false}
                    onChange={onChange}
                    autoComplete="off"
                    onBlur={() => {
                      if (!form.txtNumero) {
                        setError({ ...errors, txtNumero: true });
                      } else {
                        setError({ ...errors, txtNumero: false });
                      }
                    }}
                  />
                  <TextField
                    prefix="-"
                    label="Con"
                    id="txtCon"
                    placeholder="00"
                    value={form.txtCon}
                    error={errors.txtCon ? true : false}
                    onChange={onChange}
                    autoComplete="off"
                    onBlur={() => {
                      if (!form.txtCon) {
                        setError({ ...errors, txtCon: true });
                      } else {
                        setError({ ...errors, txtCon: false });
                      }
                    }}
                  />
                  <TextField
                    label="Barrio/Apto/Unidad"
                    id="txtBarrio"
                    value={form.txtBarrio}
                    error={errors.txtBarrio ? true : false}
                    onChange={onChange}
                    autoComplete="off"
                    onBlur={() => {
                      if (!form.txtBarrio) {
                        setError({ ...errors, txtBarrio: true });
                      } else {
                        setError({ ...errors, txtBarrio: false });
                      }
                    }}
                  />
                </FormLayout.Group>
              </FormLayout>
              <TextField
                value={form.txtPhone}
                onChange={onChange}
                placeholder="Télefono"
                label="Télefono"
                error={errors.txtPhone ? true : false}
                id="txtPhone"
                onBlur={() => {
                  if (!form.txtPhone) {
                    setError({ ...errors, txtPhone: true });
                  } else {
                    setError({
                      ...errors,
                      txtPhone: false,
                      formSubmited: false,
                    });
                  }
                }}
                type="text"
              />
              <TextField
                value={form.txtShop}
                onChange={onChange}
                label="Nombre de la tienda"
                disabled={true}
                onBlur={() => {
                  if (!form.txtShop) {
                    setError({ ...errors, txtShop: true });
                  } else {
                    setError({
                      ...errors,
                      txtShop: false,
                      formSubmited: false,
                    });
                  }
                }}
                id="txtShop"
                type="text"
              />
            </React.Fragment>
          )}
        </FormLayout>
      )}
      {showToast.active ? (
        <Toast
          content={showToast.content}
          onDismiss={() => setShowToast({ active: false })}
        />
      ) : null}
    </Form>
  );
};

export default SignupForm;
