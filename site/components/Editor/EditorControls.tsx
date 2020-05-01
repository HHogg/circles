import * as React from 'react';
import { useMatchMedia, Button, Buttons, CheckBox, Flex, Icon } from 'preshape';
import { TypeMode } from '../../Types';
import { URLStateContext } from '../URLState';

const canSave = typeof window !== 'undefined' && window.Blob !== undefined;

interface Props {
  canRedo: boolean;
  canUndo: boolean;
  mode: TypeMode;
  onChangeMode: (mode: TypeMode) => void;
  onClear: () => void;
  onRedo: () => void;
  onSave: () => void;
  onUndo: () => void;
}

export default (props: Props) => {
  const match = useMatchMedia(['600px', '800px']);
  const { canUndo, canRedo, mode, onChangeMode, onClear, onRedo, onSave, onUndo } = props;
  const { debug, onUpdateUrlState } = React.useContext(URLStateContext);

  return (
    <Flex
        alignChildrenHorizontal="between"
        alignChildrenVertical="middle"
        direction={ match('800px') ? 'horizontal' : 'vertical' }
        gap={ match('800px') ? 'x6' : 'x3' }
        padding="x6">
      <Flex
          alignChildrenHorizontal={ match('800px') ? 'start' : 'between' }
          alignChildrenVertical="middle"
          direction="horizontal"
          gap="x6">
        <Flex>
          <Buttons>
            <Button
                color="positive"
                disabled={ !canSave }
                gap="x1"
                onClick={ () => onSave() }>
              <Flex><Icon name="Save" size="1rem" /></Flex>
              { match('600px') && <Flex>Save</Flex> }
            </Button>

            <Button
                color="negative"
                gap="x1"
                onClick={ () => onClear() }>
              <Flex><Icon name="File" size="1rem" /></Flex>
              { match('600px') && <Flex>Clear</Flex> }
            </Button>
          </Buttons>
        </Flex>

        <Flex>
          <Buttons joined>
            <Button
                disabled={ !canUndo }
                gap="x1"
                onClick={ () => onUndo() }>
              <Flex><Icon name="Undo" size="1rem" /></Flex>
              { match('600px') && <Flex>Undo</Flex> }
            </Button>

            <Button
                disabled={ !canRedo }
                gap="x1"
                onClick={ () => onRedo() }>
              <Flex><Icon name="Redo" size="1rem" /></Flex>
              { match('600px') && <Flex>Redo</Flex> }
            </Button>
          </Buttons>
        </Flex>
      </Flex>

      { process.env.NODE_ENV === 'development' && (
        <Flex>
          <CheckBox
              checked={ debug }
              margin="x2"
              onChange={ () => onUpdateUrlState({ debug: !debug }) }>
            Debug
          </CheckBox>
        </Flex>
      ) }

      <Flex>
        <Buttons joined>
          <Button
              active={ mode === 'draw' }
              gap="x1"
              onClick={ () => onChangeMode('draw') }>
            <Flex><Icon name="Pencil" size="1rem" /></Flex>
            { match('600px') && <Flex>Draw</Flex> }
          </Button>
          <Button
              active={ mode === 'fill' }
              gap="x1"
              onClick={ () => onChangeMode('fill') }>
            <Flex><Icon name="Water" size="1rem" /></Flex>
            { match('600px') && <Flex>Fill</Flex> }
          </Button>
          <Button
              active={ mode === 'view' }
              gap="x1"
              onClick={ () => onChangeMode('view') }>
            <Flex><Icon name="Eye" size="1rem" /></Flex>
            { match('600px') && <Flex>View</Flex> }
          </Button>
        </Buttons>
      </Flex>
    </Flex>
  );
};
