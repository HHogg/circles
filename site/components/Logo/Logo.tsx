import * as React from 'react';
import { useLocalStorage, TypeTheme } from 'preshape';
import LogoDay from '../../assets/C-day.svg';
import LogoNight from '../../assets/C-night.svg';

interface Props extends React.SVGAttributes<SVGSVGElement> {}

export default (props: Props) => {
  const [theme] = useLocalStorage<TypeTheme>('com.hogg.theme', 'day');

  return theme === 'day'
    ? <LogoDay { ...props } />
    : <LogoNight { ...props } />;
};
