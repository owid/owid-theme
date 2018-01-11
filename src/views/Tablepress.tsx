import * as settings from '../settings'
import * as React from 'react'

export default function Tablepress(props: { data: string[][] }) {
    const {data} = props
    return <table className="tablepress">
        <thead>
            <tr>
                {data[0].map(title => <th dangerouslySetInnerHTML={{__html: title}}/>)}
            </tr>
        </thead>
        <tbody className="row-hover">
            {data.slice(1).map(row => 
                <tr>
                    {row.map(value => <td dangerouslySetInnerHTML={{__html: value}}/>)}
                </tr>
            )}
        </tbody>
    </table>
}