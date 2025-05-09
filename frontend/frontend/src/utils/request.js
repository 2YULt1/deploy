import { message } from 'antd';

const BASE_HOST = 'http://localhost:5005';

const defaultOptions = {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
};

function get(url) {
    return fetch(`${BASE_HOST}${url}`, {
            ...defaultOptions,
            method: 'GET',
            headers: {
                ...defaultOptions.headers,
                Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                message.error(data.error)
                return
            }
            return data;
        })
        .catch((err) => message.error(err.message));
}

function post(url, data) {
    return fetch(`${BASE_HOST}${url}`, {
            ...defaultOptions,
            method: 'POST',
            headers: {
                ...defaultOptions.headers,
                Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                message.error(data.error)
                return
            }
            return data;
        })
}

function put(url, data) {
    return fetch(`${BASE_HOST}${url}`, {
            ...defaultOptions,
            method: 'PUT',
            headers: {
                ...defaultOptions.headers,
                Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                message.error(data.error)
                return
            }
            return data;
        })
        .catch((err) => message.error(err.message));
}

export {get, post, put };