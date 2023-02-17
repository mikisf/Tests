import { useEffect, useRef, useState } from "react";
import * as ifcElements from "web-ifc";

export default function Home() {

    useEffect(() => {
        console.log(ifcElements.IFCSITE)
        console.log(eval("ifcElements.IFCSITE"))
    }, [])

    return (
        <h1>
            Hey
        </h1>
    )
}