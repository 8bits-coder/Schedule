interface ContainerProps {
  children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return <div className="container max-w-4xl p-10 mx-auto bg-white rounded-2xl">{children}</div>;
};

export default Container;
