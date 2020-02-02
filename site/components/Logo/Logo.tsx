import * as React from 'react';
import LogoDay from '../../assets/C-day.svg';
import LogoNight from '../../assets/C-night.svg';
import URLStateContext from '../URLState/URLStateContext';

interface Props extends React.SVGAttributes<SVGSVGElement> {}

export default (props: Props) => {
  const { theme } = React.useContext(URLStateContext);

  return theme === 'day'
    ? <LogoDay { ...props } />
    : <LogoNight { ...props } />;
};
