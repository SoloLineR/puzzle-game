export const PuzzlePiece = ({
  imgUrl,
  index,
  onPieceClick,
}: {
  imgUrl?: string;
  index: number;
  onPieceClick?: (index: number) => void;
}) => {
  return (
    <img
      src={imgUrl}
      className={'curosr-pointer box-border block h-auto w-full border'}
      onClick={() => onPieceClick && onPieceClick(index)}
      alt="puzzle piece"
    />
  );
};
