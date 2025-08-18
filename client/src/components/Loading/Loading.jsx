import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <div className={styles.cont}>
      <center>
        <div className={styles.message}>
          <div className={styles.span}></div>
          <div className={styles.line}></div>
          <br />
          <div className={styles.line2}></div>
        </div>
      </center>
    </div>
  );
}
