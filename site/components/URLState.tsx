import * as React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  useUrlState,
  URLStateDecoders,
  URLStateDefaults,
  URLStateEncoders,
  URLStateValidators,
} from 'preshape';

export interface URLState {
  debug: boolean;
}

const urlStateDecoders: URLStateDecoders<URLState> = {
  debug: (v) => JSON.parse(v),
};

const urlStateDefaults: URLStateDefaults<URLState> = {
  debug: false,
};

const urlStateEncoders: URLStateEncoders<URLState> = {
  debug: (v) => v.toString(),
};

const urlStateValidators: URLStateValidators<URLState> = {
  debug: (v) => v === true || v === false,
};

export const URLStateContext = React.createContext<URLState & {
  onUpdateUrlState: (state: Partial<URLState>) => void;
  push: (pathname: string) => void;
  search: string;
}>({
  debug: false,
  onUpdateUrlState: () => {},
  push: () => {},
  search: '',
});

const URLState: React.FC<{}> = (props) => {
  const history = useHistory();
  const location = useLocation();
  const state = useUrlState<URLState>({
    decoders: urlStateDecoders,
    defaults: urlStateDefaults,
    encoders: urlStateEncoders,
    onUpdateSearch: (search) => history.replace({ search }),
    search: location.search,
    validators: urlStateValidators,
  });

  const push = (pathname: string) => history.push({
    pathname: pathname,
    search: state.search,
  });

  return (
    <URLStateContext.Provider { ...props } value={ { ...state, push } } />
  );
};

export default URLState;
