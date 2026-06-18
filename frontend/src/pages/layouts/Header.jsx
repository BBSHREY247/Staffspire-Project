function Header() {

    const user =
    JSON.parse(
        localStorage.getItem("user")
    );

    return (

        <div className="header">

            <h2>
                Welcome {user.name}
            </h2>

            <p>
                Role: {user.role}
            </p>

        </div>

    );

}

export default Header;