import * as React from 'react';
import { Flex, Grid, Link, Modal, ModalBody, ModalHeader, Text } from 'preshape';
import { Data } from '../../Types';
import configurations from './configurations';
import { DataContext } from '../App/App';
import { URLStateContext } from '../URLState/URLState';

export default () => {
  const { onSetData } = React.useContext(DataContext);
  const { push } = React.useContext(URLStateContext);

  const handleClose = () => {
    push('/');
  };

  const handleSelect = (config: Data) => {
    onSetData(config);
    handleClose();
  };

  return (
    <Modal
        gap="x6"
        margin="x6"
        maxWidth="800px"
        onClose={ handleClose }
        padding="x6"
        scrollable
        visible>
      <ModalHeader>
        <Text strong>Library</Text>
      </ModalHeader>

      <ModalBody>
        <Grid
            gap="x6"
            margin="x6"
            repeatWidthMin="180px">
          { configurations.map(({ author, config, name, Thumbnail }) => (
            <Link
                backgroundColor="background-shade-1"
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
      </ModalBody>
    </Modal>
  );
};
