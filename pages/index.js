import { useEffect, useRef, useState } from "react";
import { IFCSITE } from "web-ifc";

export default function Home() {

    useEffect(() => {
        console.log(IFCSITE)
        console.log(eval("IFCSITE"))
    }, [])

    return (
        <h1>
            Hey
        </h1>
    )
}