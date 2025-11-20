type PropsType = {
  children: React.ReactNode;
  modal: React.ReactNode;
};

export default function MedicinesLayout({ children, modal }: PropsType) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

