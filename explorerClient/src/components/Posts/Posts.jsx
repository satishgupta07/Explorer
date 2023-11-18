import React from "react";
import CreatePost from "./CreatePost";

function Posts() {
  return (
    <div className="home">
        < CreatePost />
      <div className="card home-card">
        <h5>Ramesh</h5>
        <div className="card-image">
          <img src="https://images.unsplash.com/photo-1558981285-6f0c94958bb6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60" />
        </div>
        <div className="card-content">
          <i class="material-icons" style={{ color: "red" }}>
            favorite
          </i>
          <h6>title</h6>
          <p>this is amazing post</p>
          <div style={{ display: "flex" }}>
            <input type="text" placeholder="add a comment" />
            <button className="btn-floating btn waves-effect waves-light blue">
              <i class="material-icons">send</i>
            </button>
          </div>
        </div>
      </div>

      <div className="card home-card">
        <h5>Suresh</h5>
        <div className="card-image">
          <img src="https://images.unsplash.com/photo-1481833761820-0509d3217039?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60" />
        </div>
        <div className="card-content">
          <i class="material-icons" style={{ color: "red" }}>
            favorite
          </i>
          <h6>title</h6>
          <p>this is amazing post</p>
          <div style={{ display: "flex" }}>
            <input type="text" placeholder="add a comment" />
            <button className="btn-floating btn waves-effect waves-light blue">
              <i class="material-icons">send</i>
            </button>
          </div>
        </div>
      </div>

      <div className="card home-card">
        <h5>Mukesh</h5>
        <div className="card-image">
          <img src="https://images.unsplash.com/photo-1507090960745-b32f65d3113a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60" />
        </div>
        <div className="card-content">
          <i class="material-icons" style={{ color: "red" }}>
            favorite
          </i>
          <h6>title</h6>
          <p>this is amazing post</p>
          <div style={{ display: "flex" }}>
            <input type="text" placeholder="add a comment" />
            <button className="btn-floating btn waves-effect waves-light blue">
              <i class="material-icons">send</i>
            </button>
          </div>
        </div>
      </div>

      <div className="card home-card">
        <h5>Arjun</h5>
        <div className="card-image">
          <img src="https://images.unsplash.com/photo-1496449903678-68ddcb189a24?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60" />
        </div>
        <div className="card-content">
          <i class="material-icons" style={{ color: "red" }}>
            favorite
          </i>
          <h6>title</h6>
          <p>this is amazing post</p>
          <div style={{ display: "flex" }}>
            <input type="text" placeholder="add a comment" />
            <button className="btn-floating btn waves-effect waves-light blue">
              <i class="material-icons">send</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Posts;
