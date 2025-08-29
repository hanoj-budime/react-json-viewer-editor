import React from 'react'

export default function SearchBar({ data }: any) {
  // placeholder UI - full search implementation in advanced iterations
  return (
    <div className="p-2">
      <input className="rounded p-1" placeholder="Search (key/value)" aria-label="Search" />
    </div>
  )
}