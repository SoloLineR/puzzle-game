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
      className={"border box-border block w-full h-auto curosr-pointer"}
      onClick={() => onPieceClick && onPieceClick(index)}
      alt="puzzle piece"
    />
  );
};
