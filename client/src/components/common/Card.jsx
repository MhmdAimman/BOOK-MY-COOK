const Card = ({
  children,
  className = '',
  hover = true,
  padding = 'p-6',
  onClick,
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md ${padding} ${hover ? 'hover:shadow-lg transition-shadow duration-200' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
