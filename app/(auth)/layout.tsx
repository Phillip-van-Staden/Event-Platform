const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center min-h-screen w-full overflow-hidden relative bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {children}
    </div>
  );
};
export default Layout;
