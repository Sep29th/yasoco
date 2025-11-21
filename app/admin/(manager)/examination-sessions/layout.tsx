type PropsType = {
  children: React.ReactNode;
  modal: React.ReactNode;
};

export default function ExaminationSessionsLayout({
  children,
  modal,
}: PropsType) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
