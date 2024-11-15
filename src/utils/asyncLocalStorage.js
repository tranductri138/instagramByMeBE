import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

export const withContext = (req, res, next) => {
    asyncLocalStorage.run(new Map(), () => {
        asyncLocalStorage.getStore();
        next();
    });
};

export const getContext = () => asyncLocalStorage.getStore();

/**
 * @returns {{role: string , id: ObjectId , userName: string , areas: ObjectId[]}}
 */
export const getUserContext = () => {
    if (!asyncLocalStorage || typeof asyncLocalStorage.getStore !== 'function') {
        return {};
    }
    const store = asyncLocalStorage.getStore();
    if (!store || typeof store.get !== 'function') {
        return {};
    }
    const user = store.get('user');
    if (!user) {
        return {};
    }
    return user;
};
