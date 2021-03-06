import shop from "../api/shop";
import {message} from "antd";

const initialState = window.localStorage.localCart ? JSON.parse(window.localStorage.localCart) : {
    added: [],
    quantities: {},
    addedSelect: [],
    num: 0
}
export default {
    namespace: "cart",
    state: initialState,
    effects: {
        * add({payload: {id,size}}, {put, select}) {
            const product = yield select(state => state.products.byId[id]);
            console.log('product', product);
            yield product.size = size
            const {cart} = yield select();


            const num = cart.num + 1;
            yield put({
                type: 'addToCart',
                payload: {
                    id,
                    num
                }
            })

        },
        * minus({payload: {id}}, {put, select}) {
            const product = yield select(state => state.products.byId[id]);
            console.log('product', product);
            const {cart} = yield select();


            const num = cart.num - 1;
            yield put({
                type: 'decrease',
                payload: {
                    id,
                    num
                }
            })

        },
        * checkout({payload}, {call, put, select}) {
            const {cart} = yield select();
            console.log("checkout cart", cart);
            yield window.localStorage.removeItem('localCart')
            const res = yield call(shop.buyProducts, cart);
            yield put({
                type: "checkoutCompleted",
                payload: res
            });
            yield message.success('成功支付')

            yield window.location.reload()
        },
        * delete({payload: {log, num}}, {put, select}) {
            const {cart} = yield select();
            const checkAdult = (logs) => {
                return logs !== log
            };
            const deleteNum = cart.num - num
            const deleteAdded = cart.added.filter(checkAdult);
            console.log(cart.quantities);

            yield put({
                type: "deletelog",
                payload: {
                    deleteAdded: deleteAdded,
                    deleteNum: deleteNum,
                    log: log
                }
            });
        }
    },
    reducers: {
        addToCart: (state, {payload: {id, num}}) => {
            console.log('state', state)
            window.localStorage.localCart = JSON.stringify({
                ...state,
                added: state.added.includes(id) ? [...state.added] : [...state.added, id],
                quantities: {
                    ...state.quantities,
                    [id]: (state.quantities[id] || 0) + 1
                },
                num: num
            })
            return {
                ...state,
                added: state.added.includes(id) ? [...state.added] : [...state.added, id],
                quantities: {
                    ...state.quantities,
                    [id]: (state.quantities[id] || 0) + 1
                },
                num: num
            }
        },
        decrease: (state, {payload: {id, num}}) => {
            console.log('state', state)
            return {
                ...state,
                added: state.added.includes(id) ? [...state.added] : [...state.added, id],
                quantities: {
                    ...state.quantities,
                    [id]: (state.quantities[id] || 0) - 1
                },
                num: num
            }
        },
        checkoutCompleted: () => initialState,
        deletelog: (state, {payload: {deleteAdded, deleteNum, log}}) => {
            window.localStorage.removeItem('localCart')
            return {
                ...state,
                added: deleteAdded,
                num: deleteNum,
                quantities: {
                    ...state.quantities,
                    [log]: 0
                }
            }
        }
    }
};

