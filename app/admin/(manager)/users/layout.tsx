type Props = {
  children: React.ReactNode;
  modal: React.ReactNode;
};

export default function UsersLayout({ children, modal }: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

