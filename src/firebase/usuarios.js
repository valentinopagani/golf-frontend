import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const getUsuarios = async () => {
	const usuariosCollection = collection(db, "usuarios");

	const usuariosSnapshot = await getDocs(usuariosCollection);

	const usuariosData = usuariosSnapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	}));

	return usuariosData;
};

export default getUsuarios;
