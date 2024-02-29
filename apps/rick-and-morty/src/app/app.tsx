import styles from './app.module.css';
import { useGetCharacters } from './data/useGetCharacters';

export function App() {
  const charactersQuery = useGetCharacters({
    visibility: 'public',
  });
  const characters = charactersQuery.data?.results;

  return (
    <div>
      <h1 className={styles.title}>Welcome, Traveler</h1>
      <div className={styles.container}>
        {characters?.map((character) => (
          <div key={character.id} className={styles.card}>
            <img
              src={character.image}
              alt={character.name}
              className={styles.cardImage}
            />
            <div className={styles.cardContent}>
              <h2 className={styles.cardTitle}>{character.name}</h2>
              <p className={styles.cardInfo}>Status: {character.status}</p>
              <p className={styles.cardInfo}>Species: {character.species}</p>
              <p className={styles.cardInfo}>Size: {character.size}</p>
              <p className={styles.cardInfo}>
                Location: {character.location.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
