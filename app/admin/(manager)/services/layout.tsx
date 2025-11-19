type PropsType = {
  children: React.ReactNode;
  modal: React.ReactNode;
};

export default function ServicesLayout({ children, modal }: PropsType) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

