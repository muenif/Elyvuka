import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="wrap">
      <Header />
      <main>{children}</main>
    </div>
  );
}
