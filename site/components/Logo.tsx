import * as React from 'react';
import LogoDay from '../assets/C-day.svg';
import LogoNight from '../assets/C-night.svg';
import { AppContext } from './App';

interface Props extends React.SVGAttributes<SVGSVGElement> {}

export default (props: Props) => {
  const { theme } = React.useContext(AppContext);

  return theme === 'day'
    ? <LogoDay { ...props } />
    : <LogoNight { ...props } />;
};
