import * as React from 'react';
import {
  Button,
  Buttons,
  Icon,
  Placement,
  PlacementArrow,
  PlacementContent,
  PlacementReferenceElement,
} from 'preshape';

interface Props {
  onCopy: () => void;
  onDelete: () => void;
  targetRect: {
    height: number;
    width: number;
    x: number;
    y: number;
  } | null;
}

export default (props: Props) => {
  const { onCopy, onDelete, targetRect } = props;
  const [visible, setVisible] = React.useState(false);
  const referenceElement = targetRect ? new PlacementReferenceElement(targetRect) : undefined;

  React.useEffect(() => {
    setVisible(!!targetRect);
  }, [targetRect]);

  return (
    <Placement
        options={ { referenceElement } }
        placement="top"
        unrender
        visible={ visible }
        zIndex={ 1 }>
      <PlacementArrow backgroundColor="text-shade-1" />
      <PlacementContent
          backgroundColor="text-shade-1"
          borderRadius="x1"
          padding="x1"
          textColor="background-shade-1">
        <Buttons>
          <Button fill onPointerUp={ onCopy }>
            <Icon name="Copy" size="1rem" />
          </Button>

          <Button color="negative" fill onPointerDown={ onDelete }>
            <Icon name="Delete" size="1rem" />
          </Button>
        </Buttons>
      </PlacementContent>
    </Placement>
  );
};
