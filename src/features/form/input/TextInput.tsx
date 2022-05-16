import React from 'react'
import styles from './TextInput.module.css'

interface TextInputProps {
  initialValue: number|string
  ariaLabel: string
}

export default function TextInput({initialValue, ariaLabel}: TextInputProps) {
  const [value, setValue] = React.useState(initialValue?.toString())
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)

  const rendered = <input
    className={styles.textbox}
    aria-label={ariaLabel}
    value={value}
    onChange={onChange}
  />

  return {
    rendered,
    value,
    setValue,
  }
}
