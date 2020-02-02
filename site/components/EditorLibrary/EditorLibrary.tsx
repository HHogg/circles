import * as React from 'react';
import { Flex, Grid, Link, Text } from 'preshape';
import { Data } from '../../Types';
import configurations from './configurations';
import { DataContext } from '../App/App';
import URLStateContext from '../URLState/URLStateContext';
import Modal from '../Modal/Modal';

export default () => {
  const { onSetData } = React.useContext(DataContext);
  const { pushWithState } = React.useContext(URLStateContext);

  const handleClose = () => {
    pushWithState('/');
  };

  const handleSelect = (config: Data) => {
    onSetData(config);
    handleClose();
  };

  return (
    <Modal
        fullHeight
        maxWidth="800px"
        onClose={ handleClose }
        title="Library"
        visible>
      <Flex direction="vertical" grow>
        <Flex basis="none" direction="vertical" grow scrollable>
          <Flex basis="none" grow>
            <Flex paddingHorizontal="x6" paddingVertical="x6">
              <Grid
                  gap="x6"
                  margin="x6"
                  repeatWidthMin="180px">
                { configurations.map(({ author, config, name, Thumbnail }) => (
                  <Link
                      backgroundColor="background-shade-2"
                      borderSize="x2"
                      display="block"
                      key={ name }
                      onClick={ () => handleSelect(config) }
                      padding="x3">
                    <Flex direction="vertical" height="100%">
                      <Flex grow>
                        { Thumbnail && <Thumbnail /> }
                      </Flex>

                      <Flex>
                        <Text size="x1" strong>{ name }</Text>
                        { author && <Text emphasis size="x1">by { author }</Text> }
                      </Flex>
                    </Flex>
                  </Link>
                ))
                }
              </Grid>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Modal>
  );
};
