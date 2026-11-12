/** Link interno: <Link to="/baralhos">Baralhos</Link> */
export function Link({ to, children, ...props }) {
  return (
    <a href={`#${to}`} {...props}>
      {children}
    </a>
  )
}
