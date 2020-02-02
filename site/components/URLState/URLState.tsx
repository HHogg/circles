import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { TypeTheme } from 'preshape';
import URLStateContext, { URLStateContextProps } from './URLStateContext';

export interface URLState {
  debug?: boolean;
  theme?: TypeTheme;
}

export const defaultValues: Required<URLState> = {
  debug: false,
  theme: 'day',
};

const validators: { [K in keyof URLState]: (v: URLState[K]) => boolean } = {
  debug: (v) => v === true || v === false,
  theme: (v) => v === 'day' || v === 'night',
};

const getURLSearchParams = (search: string) => {
  const urlSearchParams = new URLSearchParams(search);

  urlSearchParams.forEach((v, k) => {
    try {
      const key = k as keyof URLState;
      const value = JSON.parse(v);
      const validator = validators[key];

      if (!validator || !validator(value) || defaultValues[key] === value) {
        urlSearchParams.delete(k);
      }
    } catch (e) {
      urlSearchParams.delete(k);
    }
  });

  return urlSearchParams;
};

const getURLSearchParamsAsObject = (search: string) => {
  const object: URLState = {};

  getURLSearchParams(search).forEach((value, key) => {
    object[key as keyof URLState] = JSON.parse(value);
  });

  Object.entries(defaultValues).forEach(([k, v]) => {
    const key = k as keyof URLState;

    if (!object.hasOwnProperty(key)) {
      object[key] = v;
    }
  });

  return object as Required<URLState>;
};
const URLState: React.FC<{}> = (props) => {
  const history = useHistory();
  const location = useLocation();
  const refState = React.useRef<string>(location.search);

  const handleSetURLState = (search: string) => {
    refState.current = search;
    history.replace({ search });
  };

  const handleUpdateURLState = (state: Partial<URLState>) => {
    const urlSearchParams = getURLSearchParams(location.search);

    Object.entries(state).forEach(([k, v]) => {
      const key = k as keyof URLState;
      const validator = validators[key];

      if (validator && validator(v) && defaultValues[key] !== v) {
        urlSearchParams.set(key, JSON.stringify(v));
      } else {
        urlSearchParams.delete(key);
      }
    });

    handleSetURLState(urlSearchParams.toString());
  };

  React.useEffect(() => {
    handleSetURLState(getURLSearchParams(location.search).toString());
  }, []);

  const value: URLStateContextProps = {
    ...getURLSearchParamsAsObject(location.search),
    onUpdateURLState: handleUpdateURLState,
    pushWithState: (path) => history.push(`${path}?${refState.current}`),
  };

  return (
    <URLStateContext.Provider { ...props } value={ value } />
  );
};

export default URLState;
