import { Button, Loader } from '@ui';
import { useDispatch } from 'react-redux';
import { onEditReview } from '@features/root/rootSlice.js';
import { rootConstants } from '@features';


export const ReviewList = ({ reviews, status, error, message, averageRating, onDeleteReview }) => {
  const dispatch = useDispatch();

  const handleEditClick = (id) => {
    dispatch(onEditReview(id));
  };

  if (status === rootConstants.COMPONENTS.STATUS.LOADING) {
    return <Loader containerProps="my-5" />;
  }

  if (status === rootConstants.COMPONENTS.STATUS.ERROR && error) {
    return (
      <div className="text-center text-red-500 font-semibold">
        {message}
      </div>
    );
  }

  if (status === rootConstants.COMPONENTS.STATUS.SUCCESS && reviews.length > 0) {
    return (
      <div className="grid gap-2">
        <div className="flex flex-wrap justify-between gap-3 font-semibold my-4">
          <p>{reviews.length} reviews</p>
          <p>Average Rating: {averageRating}</p>
        </div>
        <ul className="grid gap-3">
          {reviews.map(({ review, rating, id }) => (
            <li key={id} className="grid gap-3 relative bg-white rounded-md border p-5 pr-9 min-h-[100px]">
              <div className="absolute right-0 top-0 flex h-[33px] w-[33px] items-center justify-center rounded bg-neutral-900 text-white font-bold">
                {rating}
              </div>
              <p className="break-all">{review}</p>
              <div className="flex gap-2">
                <Button onClick={() => handleEditClick(id)}>Edit</Button>
                <Button variant="danger" onClick={() => onDeleteReview(id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

export default ReviewList;
