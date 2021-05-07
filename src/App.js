import { useState } from 'react';
import { EasybaseProvider, useEasybase } from 'easybase-react';
import ebconfig from './ebconfig';

function App() {
  return (
    <EasybaseProvider ebconfig={ebconfig}>
      <DbExample />
    </EasybaseProvider>
  );
}

function Card({ title, rating, released, _key }) {
  const { db } = useEasybase();
  
  const cardStyle = {
    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
    margin: 10,
    padding: '10px 10px 0 10px',
    borderRadius: 10,
    color: '#222',
    position: 'relative'
  }

  const deleteButtonStyle = {
    position: 'absolute',
    top: 5,
    right: 3,
    border: 'none',
    backgroundColor: 'white'
  }

  const deleteButtonClicked = async () => {
    await db('MOVIE-RATINGS').delete().where({ _key }).one();
  }

  return (
    <div style={cardStyle}>
      <button style={deleteButtonStyle} onClick={deleteButtonClicked}>&#10060;</button>
      <h3 style={{ fontWeight: 'normal' }}>Title: <b>{title}</b></h3>
      <h5 style={{ fontWeight: 'normal' }}>Rating: <b>{rating}</b></h5>
      <h5 style={{ fontWeight: 'normal' }}>Released: <b>{released.substring(0, 10)}</b></h5>
    </div>
  )
}

function DbExample() {
  const [isChecked, setIsChecked] = useState(false);
  const { db, useReturn, e } = useEasybase();

  const { frame } = useReturn(() => {
    if (isChecked)
      return db('MOVIE-RATINGS').return().where(
        e.or(
          e.gt('rating', 80),   // gt = greater than
          e.like('title', 'F%') // like = regex match where % represents zero, one or multiple chars
        )
      )
    else
      return db('MOVIE-RATINGS').return()
  }, [isChecked]);

  const insertRecord = async () => {
    try {
      const inTitle = prompt("Please enter the movie title", "Harry Potter");
      const inRating = prompt("Please enter the movie rating as a number", "59");
      const inReleased = prompt("Please enter the movie release date in the form YYYY-MM-DD", "2018-04-13");
      if (!inTitle || !inReleased || !inRating) return;

      await db('MOVIE-RATINGS').insert({
        title: inTitle,
        rating: Number(inRating),
        released: new Date(inReleased)
      }).one();
    } catch (_) {
      alert("Error on input format")
    }
  }

  const insertRootStyle = {
    border: "3px dashed #A4C",
    borderRadius: 9,
    margin: 10,
    width: 140,
    color: "#A4C",
    backgroundColor: "white"
  }

  const updateButtonStyle = {
    margin: 13,
    fontSize: 15,
    padding: 10,
    borderWidth: 0,
    borderRadius: 2,
    boxShadow: '0 1px 4px rgba(0, 0, 0, .4)',
    backgroundColor: '#A4C',
    color: 'white'
  }

  const onUpdateClick = () => {
    db('MOVIE-RATINGS')
      .set({ 'rating': 0 })                       // Set 'rating' to 0
      .where(e.dateLt('released', '2000-01-01'))  // Where release before January 1st, 2000
      .all();                                     // Perform on all matches
  }

  return (
    <div>
      <div style={{ margin: 13 }}>
        <label>
          <b>Only above 80 or starts with 'F' </b>
          <input
            type="checkbox"
            value={isChecked}
            onChange={e => setIsChecked(e.target.checked)}
          />
        </label>
      </div>
      <div style={{ display: "flex" }}>
        {frame.map(ele => <Card {...ele} />)}
        <button style={insertRootStyle} onClick={insertRecord}>+ Add Record</button>
      </div>
      <button style={updateButtonStyle} onClick={onUpdateClick}>Update Old Movies</button>
    </div>
  )
}

export default App;
