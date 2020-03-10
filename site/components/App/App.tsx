import * as React from 'react';
import { Route, Switch, useLocation } from 'react-router-dom';
import { useTheme, Flex, Icon, Link, List, ListItem, ThemeSwitcher } from 'preshape';
import { Data, TypeMode } from '../../Types';
import Fox from '../EditorLibrary/configurations/Fox.json';
import About from '../About/About';
import Editor from '../Editor/Editor';
import EditorLibrary from '../EditorLibrary/EditorLibrary';
import Logo from '../Logo/Logo';
import URLStateContext from '../URLState/URLStateContext';

export const DataContext = React.createContext<{
  data: Data;
  onSetData: (data: Data) => void;
}>({
  data: { circles: [], intersections: [] },
  onSetData: () => {},
});

export default () => {
  const {
    onUpdateURLState,
    theme,
  } = React.useContext(URLStateContext);

  const location = useLocation();
  const [data, onSetData] = React.useState<Data>(Fox);
  const [mode, onSetMode] = React.useState<TypeMode>('view');

  const handleClear = () => {
    onSetData({ intersections: [], circles: [] });
    onSetMode('draw');
  };

  const handleSetData = (data: Data) => {
    onSetData(data);
    onSetMode('view');
  };

  useTheme(theme);

  return (
    <DataContext.Provider value={ { data: data, onSetData: handleSetData } }>
      <Flex backgroundColor="background-shade-1" direction="vertical" grow>
        <Flex
            alignChildrenVertical="middle"
            direction="horizontal"
            gap="x6"
            paddingHorizontal="x6"
            paddingVertical="x2">
          <Flex
              alignChildrenVertical="middle"
              direction="horizontal"
              gap="x4"
              grow>
            <Flex>
              <Logo height="32px" width="32px" />
            </Flex>
          </Flex>

          <Flex>
            <List gap="x2">
              <ListItem separator="|">
                <Link title="Library" to={ `/library${location.search}` }>
                  <Icon name="Book" size="1.25rem" />
                </Link>
              </ListItem>

              <ListItem separator="|">
                <Link title="About" to={ `/about${location.search}` }>
                  <Icon name="Info" size="1.25rem" />
                </Link>
              </ListItem>

              <ListItem separator="|">
                <Link href="https://github.com/HHogg/circles" target="Github" title="Github">
                  <Icon name="Github" size="1.25rem" />
                </Link>
              </ListItem>

              <ListItem>
                <ThemeSwitcher
                    onChange={ (theme) => onUpdateURLState({ theme }) }
                    theme={ theme } />
              </ListItem>
            </List>
          </Flex>
        </Flex>

        <Flex basis="none" direction="vertical" grow>
          <Switch>
            <Route component={ About } path="/about" />
            <Route component={ EditorLibrary } path="/library" />
          </Switch>

          <Editor
              data={ data }
              mode={ mode }
              onChangeMode={ onSetMode }
              onClearData={ handleClear } />
        </Flex>
      </Flex>
    </DataContext.Provider>
  );
};

